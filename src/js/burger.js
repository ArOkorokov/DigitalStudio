

// export function burger() {
//     let burgerBtn = document.querySelector('.burger');

//     burgerBtn.addEventListener('click',() => {
//         burgerBtn.classList.toggle('burger-open')
//     })
// }

export function burger() {
  const burgerBtn = document.querySelector('.burger');
  const overlay = document.querySelector('.overlay');
  const navigationItems = document.querySelectorAll('.navigation__item');

  // Открытие/закрытие оверлея при клике на бургер
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('burger-open'); // Меняем состояние бургера
    overlay.classList.toggle('open'); // Открываем/закрываем оверлей

    // Когда оверлей открылся, добавляем задержку для анимации элементов меню
    if (overlay.classList.contains('open')) {
      navigationItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('active');
        }, 300 * (index + 1)); // Задержка для каждого элемента
      });
    } else {
      // Когда оверлей закрывается, удаляем класс активности
      navigationItems.forEach(item => item.classList.remove('active'));
    }
  });

  // Закрытие оверлея по клавише Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      burgerBtn.classList.remove('burger-open');
      overlay.classList.remove('open');
      navigationItems.forEach(item => item.classList.remove('active'));
    }
  });

  // Закрытие меню при клике вне оверлея или бургера
  document.addEventListener('click', (event) => {
    if (!overlay.contains(event.target) && !burgerBtn.contains(event.target)) {
      overlay.classList.remove('open');
      burgerBtn.classList.remove('burger-open');
      navigationItems.forEach(item => item.classList.remove('active'));
    }
  });
}
