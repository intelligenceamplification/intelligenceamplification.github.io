import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import postcss from 'postcss';
import path from 'node:path';
export default defineConfig({plugins:[react(),{
 name:'scope-explorer-css',enforce:'post',generateBundle(_,bundle){
  for(const asset of Object.values(bundle))if(asset.type==='asset'&&asset.fileName.endsWith('.css')){
   const css=postcss.parse(String(asset.source));
   css.walkRules(rule=>{
    if(rule.parent.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;
    rule.selectors=rule.selectors.map(selector=>selector===':root'?'#capability-explorer':selector==='body'?'#capability-explorer .app':'#capability-explorer '+selector);
   });
   asset.source=css.toString();
  }
 }
}],build:{outDir:'../assets/release-1',emptyOutDir:true,rollupOptions:{input:path.resolve(import.meta.dirname,'src/main.jsx'),output:{entryFileNames:'explorer-[hash].js',assetFileNames:'explorer-[hash][extname]'}}}});
