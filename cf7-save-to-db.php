<?php
/*
Plugin Name: CF7 Save to DB
Description: Saves Contact Form 7 submissions to the WordPress database.
Version: 1.0
Author: Ruhul Amin
*/

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// Register REST API route for submissions
add_action('rest_api_init', function () {
    register_rest_route('cf7/v1', '/submissions', [
        'methods' => 'GET',
        'callback' => 'cf7_get_submissions',
        'permission_callback' => '__return_true', // Replace with proper permissions in production
    ]);
    // Get all submissions by form id
    register_rest_route('cf7/v1', '/submissions/form/(?P<form_id>\d+)', [
        'methods' => 'GET',
        'callback' => 'cf7_get_submissions_by_form_id',
        'permission_callback' => '__return_true', // Replace with proper permissions in production
        'args' => [
            'form_id' => [
                'required' => true,
                'validate_callback' => function ($param) {
                    return is_numeric($param);
                },
            ],
        ],
    ]);
    // Get submission by ID
    register_rest_route('cf7/v1', '/submissions/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'cf7_get_submission_by_id',
        'permission_callback' => '__return_true', // Replace with proper permissions in production
        'args' => [
            'id' => [
                'required' => true,
                'validate_callback' => function ($param) {
                    return is_numeric($param);
                },
            ],
        ],
    ]);
});

// Callback function to get all submissions
function cf7_get_submissions() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'cf7_submissions';
    $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY submitted_at DESC", ARRAY_A);

    foreach ($results as &$row) {
        $row['submission_data'] = json_decode($row['submission_data'], true);
    }

    return rest_ensure_response($results);
}

// Callback function to get submissions by form ID
function cf7_get_submissions_by_form_id($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'cf7_submissions';
    $form_id = $request->get_param('form_id'); // Get the form_id parameter

    // Base query
    $query = "SELECT * FROM $table_name";
    $query_args = [];

    // Add WHERE clause if form_id is provided
    if (!empty($form_id)) {
        $query .= " WHERE form_id = %d";
        $query_args[] = $form_id;
    }

    // Add ORDER BY clause
    $query .= " ORDER BY submitted_at DESC";

    // Prepare and execute the query
    $results = $wpdb->get_results($wpdb->prepare($query, ...$query_args), ARRAY_A);

    // Decode JSON submission_data for each result
    foreach ($results as &$row) {
        $row['submission_data'] = json_decode($row['submission_data'], true);
    }

    return rest_ensure_response($results);
}

// Callback function to get submission by ID
function cf7_get_submission_by_id($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'cf7_submissions';
    $id = $request['id'];

    $submission = $wpdb->get_row(
        $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id),
        ARRAY_A
    );

    if ($submission) {
        $submission['submission_data'] = json_decode($submission['submission_data'], true);
        return rest_ensure_response($submission);
    } else {
        return new WP_Error(
            'submission_not_found',
            'Submission not found',
            ['status' => 404]
        );
    }
}

add_action('admin_enqueue_scripts', function () {
    $plugin_dir_url = plugin_dir_url(__FILE__);
    $plugin_dir_path = plugin_dir_path(__FILE__);
    
    // Path to the manifest file
    $manifest_path = $plugin_dir_path . 'dist/manifest.json';
    
    if (file_exists($manifest_path)) {
        $manifest = json_decode(file_get_contents($manifest_path), true);

        // Get the hashed JS and CSS files from the manifest
        $js_file = $manifest['index.html']['file'] ?? null;
        $css_files = $manifest['index.html']['css'] ?? [];

        // Enqueue JavaScript
        if ($js_file) {
            wp_enqueue_script(
                'cf7-react-app',
                plugin_dir_url(__FILE__) . 'dist/' . $js_file,
                [], 
                null,
                true
            );

            // Add type="module" to the script tag
            add_filter('script_loader_tag', function ($tag, $handle, $src) {
                if ($handle === 'cf7-react-app') {
                    $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
                }
                return $tag;
            }, 10, 3);

            // Localize script with API URL
            wp_localize_script('cf7-react-app', 'cf7ReactPlugin', [
                'apiUrl' => home_url(), // Provide the base API URL
            ]);
        }

      // Enqueue CSS
        foreach ($css_files as $css_file) {
            wp_enqueue_style(
                'cf7-react-app',
                $plugin_dir_url . 'dist/' . $css_file,
                [],
                null
            );
        }
    } else {
        wp_die('Manifest file not found. Please run `npm run build` in the react-app directory.');
    }
});

// Add admin menu for the React app
add_action('admin_menu', function () {
    add_menu_page(
        'CF7 Submissions',
        'CF7 Submissions',
        'manage_options',
        'cf7-react-plugin',
        function () {
            echo '<div id="root"></div>'; // Mount point for React app
        },
        'dashicons-feedback'
    );
});



// Run on plugin activation: Create a custom database table
register_activation_hook( __FILE__, 'cf7_save_to_db_create_table' );
function cf7_save_to_db_create_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'cf7_submissions';
    
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        form_id mediumint(9) NOT NULL,
        form_name varchar(255) NOT NULL,
        submission_data text NOT NULL,
        submitted_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
}


// Hook into CF7 submission
add_action( 'wpcf7_before_send_mail', 'cf7_save_to_db_submission' );
function cf7_save_to_db_submission( $contact_form ) {
    global $wpdb;

    // Get form data
    $submission = WPCF7_Submission::get_instance();
    if ( ! $submission ) {
        return;
    }

    $form_data = $submission->get_posted_data();
    $form_id = $contact_form->id();
    $form_name = $contact_form->title();
    $table_name = $wpdb->prefix . 'cf7_submissions';

    // Save form data to the database
    $wpdb->insert( 
        $table_name, 
        array(
            'form_id' => $form_id,
            'form_name' => $form_name,
            'submission_data' => json_encode( $form_data ),
            'submitted_at' => current_time( 'mysql' ),
        )
    );
}

// Add an admin menu page to view submissions
add_action( 'admin_menu', 'cf7_save_to_db_admin_menu' );
function cf7_save_to_db_admin_menu() {
    add_menu_page( 
        'CF7 Submissions', 
        'CF7 Submissions', 
        'manage_options', 
        'cf7-save-to-db', 
        'cf7_save_to_db_view_submissions', 
        'dashicons-feedback', 
        25 
    );
}

function cf7_save_to_db_view_submissions() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'cf7_submissions';
    $results = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY submitted_at DESC" );

    echo '<div class="wrap"><h1>CF7 Submissions</h1>';
    echo '<table class="wp-list-table widefat fixed striped">';
    echo '<thead><tr><th>ID</th><th>Form ID</th><th>Form Name</th><th>Submission Data</th><th>Submitted At</th></tr></thead>';
    echo '<tbody>';

    foreach ( $results as $row ) {
        echo '<tr>';
        echo '<td>' . esc_html( $row->id ) . '</td>';
        echo '<td>' . esc_html( $row->form_id ) . '</td>';
        echo '<td>';
        
        // Parse and render submission_data
        $submission_data = json_decode( $row->submission_data, true );
        if ( $submission_data ) {
            echo '<table class="wp-list-table widefat fixed striped">';
            foreach ( $submission_data as $key => $value ) {
                // Handle array values gracefully
                $value_display = is_array( $value ) ? implode( ', ', $value ) : $value;
                echo '<tr>';
                echo '<td>' . esc_html( $key ) . '</td>';
                echo '<td>' . esc_html( $value_display ) . '</td>';
                echo '</tr>';
            }
            echo '</table>';
        } else {
            echo 'Invalid submission data';
        }
        echo '</td>';
        echo '<td>' . esc_html( $row->submitted_at ) . '</td>';
        echo '</tr>';
    }

    echo '</tbody></table></div>';
}
