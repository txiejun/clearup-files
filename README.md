# clearup-files
批量清理文件夹 比如`node_modules`,`dist`等

## 使用
通过`npm install`安装依赖。  
修改`libs/index.js`代码里面的`root`路径，然后执行`npm run del`;  
**注意：** 
为了安全起见，在真正删除文件之前，可以先把`libs/index.js`代码里面的这行`deleteList(list);`注释掉，运行一次看下统计效果，然后调整过滤规则到满意程度，再打开这个代码执行真正的删除。
