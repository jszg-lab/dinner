const http = require('http');

console.log('测试API缓存控制头配置...\n');

const testCacheHeaders = (path) => {
  return new Promise((resolve) => {
    http.get(`http://localhost:3001${path}`, (res) => {
      const cacheControl = res.headers['cache-control'];
      const pragma = res.headers['pragma'];
      const expires = res.headers['expires'];
      
      console.log(`路径: ${path}`);
      console.log(`状态码: ${res.statusCode}`);
      console.log(`Cache-Control: ${cacheControl || '(未设置)'}`);
      console.log(`Pragma: ${pragma || '(未设置)'}`);
      console.log(`Expires: ${expires || '(未设置)'}`);
      
      if (cacheControl && cacheControl.includes('no-cache') && 
          cacheControl.includes('no-store') && 
          cacheControl.includes('must-revalidate')) {
        console.log('✅ 缓存控制头配置正确');
      } else {
        console.log('❌ 缓存控制头配置不完整');
      }
      console.log('');
      
      resolve();
    }).on('error', (err) => {
      console.log(`❌ 请求 ${path} 失败: ${err.message}`);
      resolve();
    });
  });
};

(async () => {
  await testCacheHeaders('/');
  await testCacheHeaders('/api/auth/login');
  await testCacheHeaders('/api/restaurants');
  
  console.log('✅ 缓存控制测试完成！');
})();
