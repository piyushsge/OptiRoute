# WordPress Integration & Publishing Guide for OptiRoute

This guide explains how to publish and embed the OptiRoute React application on your WordPress website.

---

## Method 1: Native WordPress Plugin Embedding (Recommended)
This method enqueues the compiled React JS and CSS assets directly into WordPress and loads them using a shortcode (`[optiroute]`), making the app look and feel native to your WordPress site.

### Step 1: Build the React App
Run the following build command in your terminal:
```bash
npm run build
```
This generates the optimized static assets inside the `dist/` directory. Locate the JavaScript and CSS files inside:
- `dist/assets/index-XXXXXX.js`
- `dist/assets/index-XXXXXX.css`

### Step 2: Create a WordPress Plugin
1. Connect to your WordPress site directory using FTP or a File Manager.
2. Navigate to `wp-content/plugins/`.
3. Create a new folder named `optiroute-embed`.
4. Inside that folder, create a file named `optiroute-embed.php` and paste the following PHP code:

```php
<?php
/**
 * Plugin Name: OptiRoute App Embedder
 * Description: Embeds the OptiRoute React app natively using the [optiroute] shortcode.
 * Version: 1.0.0
 * Author: OptiRoute Developer
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

function optiroute_enqueue_scripts() {
    // Only load scripts on the page containing the shortcode
    global $post;
    if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'optiroute')) {
        
        // Path to your compiled files inside the plugin folder
        $js_file  = plugins_url('assets/index.js', __FILE__);
        $css_file = plugins_url('assets/index.css', __FILE__);

        // Enqueue CSS
        wp_enqueue_style('optiroute-styles', $css_file, array(), '1.0.0');

        // Enqueue JS (as a module, because Vite builds use ES Modules)
        wp_enqueue_script('optiroute-script', $js_file, array(), '1.0.0', true);
        
        // Add module type to script tag
        add_filter('script_loader_tag', function($tag, $handle, $src) {
            if ('optiroute-script' === $handle) {
                $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
            }
            return $tag;
        }, 10, 3);
    }
}
add_action('wp_enqueue_scripts', 'optiroute_enqueue_scripts');

function optiroute_shortcode_renderer() {
    // Output the container div where the React app will mount
    return '<div id="root" class="map-focus-mode"></div>';
}
add_shortcode('optiroute', 'optiroute_shortcode_renderer');
```

### Step 3: Copy Assets to the Plugin
1. Inside the `wp-content/plugins/optiroute-embed/` folder, create a new folder named `assets`.
2. Copy your built JavaScript file from `dist/assets/index-XXXXXX.js` into this new `assets/` folder and rename it exactly to **`index.js`**.
3. Copy your built CSS file from `dist/assets/index-XXXXXX.css` into the `assets/` folder and rename it exactly to **`index.css`**.

### Step 4: Activate and Publish
1. Go to your WordPress Dashboard ➜ **Plugins** ➜ **Installed Plugins**.
2. Find **OptiRoute App Embedder** and click **Activate**.
3. Go to the page or post where you want the app to appear.
4. Add a shortcode block and type:
   `[optiroute]`
5. Publish the page.

---

## Method 2: HTML iframe Embedding (Easiest & Quickest)
If you do not want to upload files to your server, you can embed the already-published GitHub Pages version using an HTML `iframe`.

### Step 1: Copy the iframe Snippet
Copy the following HTML block:
```html
<div class="optiroute-wrapper" style="width: 100%; height: 85vh; min-height: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
  <iframe 
    src="https://piyushsge.github.io/OptiRoute/" 
    width="100%" 
    height="100%" 
    style="border: none; display: block;" 
    allow="geolocation"
  ></iframe>
</div>
```
*(Note: Replace `https://piyushsge.github.io/OptiRoute/` with your exact deployed GitHub Pages URL if it is hosted on a different account)*

### Step 2: Add to WordPress Page
1. Open the page editor in WordPress (Block Editor/Gutenberg, Elementor, or Classic Editor).
2. Add a **Custom HTML** block.
3. Paste the iframe HTML snippet.
4. Save and **Publish** the page.
