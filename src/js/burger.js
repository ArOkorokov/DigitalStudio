

export function burger() {
    let burgerBtn = document.querySelector('.burger');

    burgerBtn.addEventListener('click',() => {
        burgerBtn.classList.toggle('burger-open')
    })
    
}