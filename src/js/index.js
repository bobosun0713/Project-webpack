// import '@babel/polyfill'; // 全部JS兼容性，直接引入就好
import '../scss/index.scss';
import '../css/le.css'



const promise = new Promise((resolve) => {
  setTimeout(() => {
    console.log('執行完');
    resolve();
  }, 1000)
})

console.log(promise);


// if (module.hot) {
//   // 當開啟HRM功能
//   module.hot.accept('其他模組', function () {
//     // 監聽該模組的JS變化，該模組有變化，會執行回條函數。
//     // 只會針對該模組進行更新

//     print();

//     // 當有其他模塊需要個別監聽時，再寫一個 module.hot.accept('其他模組', function (){})
//   })
// }