// 
document.querySelector('#fullscreen').addEventListener('click', function () {
    const elem = document.documentElement; 
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
});

let counting = document.querySelector('.counting');
let total = document.querySelector('.total');
let mala = document.querySelector('.mcount');
var i = 0, j = 0, total_count = 0, count=0, mala_count=0;

document.addEventListener('DOMContentLoaded', () => {
    fetch('/myDetail')
    .then(response => response.json())
    .then(data => {
        mala.innerHTML = data[0].mala_count;
        // Use fetched mala_count and count from localStorage to set total correctly
        const malaCount = parseInt(data[0].mala_count) || 0;
        const localCount = parseInt(localStorage.getItem('count')) || 0;
        total.innerHTML = (NaN)? 0 : data[0].mala_count * 108 + parseInt(localStorage.getItem('count')); 
        window.localStorage.setItem('count', data[0].count);
        counting.innerHTML = data[0].count;
        count = data[0].count;
    })
})


document.querySelector('.click').addEventListener('click', (event) => {    
    
    if(localStorage.getItem('count') == 108){

        count=0;
        window.localStorage.setItem('count', count)
        counting.innerHTML = 0;  
        mala_count++;
        mala.innerHTML = mala_count;

    }else{

        window.localStorage.setItem('count', ++count);
        counting.innerHTML = localStorage.getItem('count');  
        
    }


    setTimeout(() => {
        fetch('/chantingupdate', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                counting : localStorage.getItem('count')
            })
        })
        .then(response => response.text())
        .then((data) => {
            if(data){
                console.log("updated");

            }else{
                console.log('Not updated')
            }
        })
    }, 1000)


    // -----------------------------dataFetching--------------------------

    fetch('/myDetail')
    .then(response => response.json())
    .then(data => {
        mala.innerHTML = data[0].mala_count;
        total.innerHTML = data[0].mala_count * 108 + parseInt(localStorage.getItem('count'));
    })


})

