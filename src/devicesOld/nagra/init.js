export default function init() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("init device");
      resolve("done");
    });
  });
}
