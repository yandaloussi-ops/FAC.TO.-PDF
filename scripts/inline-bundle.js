import fs from 'fs';
import path from 'path';

try {
  const distDir = path.resolve('dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found');
    process.exit(1);
  }

  let html = fs.readFileSync(indexHtmlPath, 'utf-8');
  const assetsDir = path.join(distDir, 'assets');

  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    const jsFile = files.find(f => f.endsWith('.js'));

    if (cssFile) {
      const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
      html = html.replace(/<link\s+rel="stylesheet"[^>]+>/i, () => `<style>\n${cssContent}\n</style>`);
    }

    if (jsFile) {
      let jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
      // Escape </script> inside JS strings to prevent premature script tag closure
      jsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');
      html = html.replace(/<script\s+type="module"[^>]+><\/script>/i, () => `<script type="module">\n${jsContent}\n</script>`);
    }
  }

  // Write single-file standalone index.html into dist/index.html (ready for publishing directly)
  fs.writeFileSync(indexHtmlPath, html, 'utf-8');
  console.log('✅ Successfully bundled into single-file dist/index.html (size: ' + (html.length / 1024).toFixed(1) + ' KB)');

  // Also write to root standalone.html for easy access and preview
  const rootStandalone = path.resolve('standalone.html');
  fs.writeFileSync(rootStandalone, html, 'utf-8');
  console.log('✅ Also copied to root standalone.html');

  // Also create a dedicated folder single_file/index.html
  const singleFileDir = path.resolve('single_file');
  if (!fs.existsSync(singleFileDir)) {
    fs.mkdirSync(singleFileDir, { recursive: true });
  }
  fs.writeFileSync(path.join(singleFileDir, 'index.html'), html, 'utf-8');
  console.log('✅ Also created single_file/index.html ready to copy or download');
} catch (err) {
  console.error('Error bundling single file:', err);
  process.exit(1);
}
