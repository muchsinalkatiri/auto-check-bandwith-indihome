const pptr = require('puppeteer');
const { createWorker } = require('tesseract.js');
const worker = createWorker();
const axios = require('axios');

var fs = require('fs');


(async ()=>{
    //     // const isp = "152730216024";
    let i = 0;
    let isp = process.argv[2];
    const date = new Date();
    const browser = await pptr.launch({
        headless: false,
        // slowMo : 100,
        // devtools: true
    });
    const page = await browser.newPage(); //membuka tab baru di browser
    await page.goto('https://subsystem.indihome.co.id/prepaid-system/Sisakuota', {waitUntil:'networkidle2'}); //membuka url
    do{
        const date_real = new Date();       
        i++;
        const image = await page.$eval('#captchanya img', el => el.src);
        console.log("["+date_real.getFullYear()+'-'+(date_real.getMonth()+1)+'-'+date_real.getDate()+' '+date_real.getHours()+':'+date_real.getMinutes()+"]");
        console.log(image);
        
        //copy ulang file languange
        fs.copyFile('bash/eng.traineddata', isp+'.traineddata', (err) => {});
        await page.waitForTimeout(5000); //delay 2 detik


        await worker.load();
        await worker.loadLanguage(isp); //isp file english language
        await worker.initialize(isp);
        var { data: { text } } = await worker.recognize(image);
        var cap = text.replace(/\n|\r/g, "");
        var cap2 = cap.replace(" ", "");
        console.log(cap2);

        await page.focus('input[name="ndmain"][type="text"]');
        await page.type('input[name="ndmain"][type="text"]' , isp, {delay: 50});
        await page.type('input[name="captcha_word"][type="text"]' , cap2, {delay: 50});
        await page.click('button[name="btnCekKuota"][type="submit"]');
        await page.waitForTimeout(1000); //delay 2 detik
        if(await page.$('#kuwota[style="display: none;"]') !== null){
            var pesan = await page.$eval('.alert-danger strong', el => el.textContent);
            // if(i == 2){
                // await page.reload(); //reload browser
            //     console.log('reload');
            // }
        await page.waitForTimeout(2000); //delay 2 detik
        }else{
            var pesan = 'ditemukan';
        }
        await page.waitForTimeout(2000); //delay 2 detik
        console.log(pesan);
        console.log(" ");
    }while(pesan != 'ditemukan');
    await worker.terminate();
    const quota = await page.$eval('#centering div[style="color:#d60000;"] p', el => el.textContent);
    const kuota = quota.toString().replace(/\n|\t/g, '').split('\r\n').toString();
    await browser.close(); //close browser
    console.log(kuota);

    
    const newData = {
        isp : isp,
        date : date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes(),
        sisa_kuota : kuota
    };
    const file = fs.readFileSync('data.json', 'utf8'); //menyimpan isi file json ke variable
    const data = JSON.parse(file); //menconvert hasil file yg json jadi bentuk JSON
    const duplikat = data.find((newData) => newData.isp === isp); //mencari duplikat
    if(duplikat){
        const hapus = data.filter(
            (data) => data.isp !== isp
        );
        if (hapus.length !== data.length) {
            fs.writeFileSync('data.json', JSON.stringify(hapus)); //memasukan array contact ke dalam file json    
        }
    }
    const file2 = fs.readFileSync('data.json', 'utf8');
    const data2 = JSON.parse(file2); //menconvert hasil file yg json jadi bentuk JSON
    data2.push(newData); // memasukan variable data ke dalam array contact
    fs.writeFileSync('data.json', JSON.stringify(data2)); //memasukan array contact ke dalam file json

    axios
    .get('http://192.168.8.2/api/report/fup/'+isp)
    .then(res => {
        console.log(`statusCode: ${res.status}`);
        process.exit();
    })
    .catch(error => {
        console.error(error);
    });
    })();
    



// await page.screenshot({path:'web.png'}); //screenshoot browser
// await page.reload(); //reload browser

// await page.goBack();//untuk kembali ke halaman sebelumnmya