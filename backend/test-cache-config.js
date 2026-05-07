const http = require('http');

console.log('测试差异化缓存配置...\n');

const testCacheHeaders = (path, expectedMaxAge) => {
  return new Promise((resolve) => {
    http.get(`http://localhost:3001${path}`, (res) => {
      const cacheControl = res.headers['cache-control'];
      const expires = res.headers['expires'];
      
      console.log(`路径: ${path}`);
      console.log(`状态码: ${res.statusCode}`);
      console.log(`Cache-Control: ${cacheControl || '(未设置)'}`);
      console.log(`Expires: ${expires || '(未设置)'}`);
      
      let success = false;
      if (expectedMaxAge > 0) {
        if (cacheControl && cacheControl.includes(`max-age=${expectedMaxAge}`)) {
          success = true;
        }
      } else {
        if (cacheControl && cacheControl.includes('no-cache') && cacheControl.includes('no-store')) {
          success = true;
        }
      }
      
      console.log(success ? '✅ 缓存配置正确' : '❌ 缓存配置不正确');
      console.log('');
      
      resolve();
    }).on('error', (err) => {
      console.log(`❌ 请求 ${path} 失败: ${err.message}`);
      resolve();
    });
  });
};

const cacheTests = [
  { path: '/api/restaurants', expectedMaxAge: 3600 },
  { path: '/api/departments', expectedMaxAge: 7200 },
  { path: '/api/users', expectedMaxAge: 1800 },
  { path: '/api/votes', expectedMaxAge: 0 },
  { path: '/api/recommendations', expectedMaxAge: 300 },
];

(async () => {
  for (const test of cacheTests) {
    await testCacheHeaders(test.path, test.expectedMaxAge);
  }
  
  console.log('✅ 差异化缓存配置测试完成！');
})();
