const { getPengaturanDataAction } = require('./src/app/actions/pengaturan');
async function test() {
  try {
    const data = await getPengaturanDataAction();
    console.log("Success");
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
