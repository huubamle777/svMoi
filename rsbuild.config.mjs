import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const siteTitle = 'Become a Meta Business Partner';
const siteDescription =
    'Discover the Meta Business Partner program and tools to grow your Page and reach audiences across Facebook and Instagram.';
const ogImageAlt = `${ siteTitle } — preview image`;

export default defineConfig( {
    plugins: [
        pluginReact(),
        {
            name: 'plugin-htaccess-spa',
            setup ( api )
            {
                api.onAfterBuild( async () =>
                {
                    const distPath = path.resolve( 'dist' );
                    const htaccessPath = path.join( distPath, '.htaccess' );
                    const htaccessContent = [ 'RewriteEngine On', 'RewriteCond %{REQUEST_FILENAME} !-f', 'RewriteCond %{REQUEST_FILENAME} !-d', 'RewriteRule ^ index.html [L]' ].join( '\n' );
                    try
                    {
                        await fs.access( distPath );
                        await fs.writeFile( htaccessPath, htaccessContent );
                        const thumbSrc = path.join( __dirname, 'src', 'assets', 'images', 'thub.webp' );
                        const thumbDest = path.join( distPath, 'thub.webp' );
                        await fs.copyFile( thumbSrc, thumbDest );
                        api.logger.info( 'htaccess build xong' );
                    } catch
                    {
                        api.logger.error( 'htaccess build fail' );
                    }
                } );
            }
        }
    ],
    tools: {
        postcss: {
            postcssOptions: {
                plugins: [ tailwindcss ]
            }
        }
    },
    resolve: {
        alias: {
            '@': './src'
        }
    },
    html: {
        title: siteTitle,
        favicon: './src/assets/images/metefavicon.ico',
        meta: {
            description: siteDescription,
        },
        tags: [
            { tag: 'meta', attrs: { property: 'og:title', content: siteTitle } },
            { tag: 'meta', attrs: { property: 'og:description', content: siteDescription } },
            { tag: 'meta', attrs: { property: 'og:image', content: 'https://i.ibb.co/JRx6sKTf/thub.webp' } },
            { tag: 'meta', attrs: { property: 'og:image:alt', content: ogImageAlt } },
            { tag: 'meta', attrs: { property: 'og:url', content: process.env.DEPLOY_URL || 'https://facebook.com' } },
            { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
            { tag: 'meta', attrs: { name: 'twitter:title', content: siteTitle } },
            { tag: 'meta', attrs: { name: 'twitter:description', content: siteDescription } },
            { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://i.ibb.co/JRx6sKTf/thub.webp' } },
            { tag: 'meta', attrs: { name: 'twitter:image:alt', content: ogImageAlt } },
        ]
    },
    source: {
        tsconfigPath: './jsconfig.json'
    },
    output: {

        dataUriLimit: {
            image: 10240, // 10KB
            svg: 10240,   // 10KB
            font: 10240,  // 10KB
            media: 10240, // 10KB
            assets: 10240 // 10KB
        },

        minify: {
            js: true,
            css: true,
            html: true
        },

        sourceMap: {
            js: false,
            css: false
        }
    },
    performance: {
        chunkSplit: {
            strategy: 'split-by-experience',
            override: {
                chunks: 'all',
                minSize: 20000,
                maxSize: 244000,
            }
        },
        preload: true,
        prefetch: true
    }
} );
