const http = require('http');

console.log('测试后端API连接...\n');

// 测试根路径
const testRoot = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ 根路径 - 状态码: ${res.statusCode}`);
        console.log(`   响应: ${data}\n`);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ 根路径错误: ${err.message}`);
      resolve();
    });
  });
};

// 测试登录接口
const testLogin = () => {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      nickname: '管理员',
      password: 'admin123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ 登录接口 - 状态码: ${res.statusCode}`);
        console.log(`   响应: ${data}\n`);
        try {
          const result = JSON.parse(data);
          if (result.success && result.token) {
            console.log('🎉 登录成功，获得token！');
          }
        } catch (e) {}
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ 登录错误: ${err.message}`);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
};

// 执行测试
(async () => {
  await testRoot();
  await testLogin();
  console.log('\n✅ API测试完成！');
})();
