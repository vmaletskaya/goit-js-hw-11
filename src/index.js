import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './gallery-card-markup.js';
import { PixabayApi } from './pixabay-api';

Notiflix.Notify.init({
  width: '300px',
  position: 'left-top',
  closeButton: false,
  distance: '20px	',
});

const pixabayApi = new PixabayApi();

const refs = {
  gallery: document.querySelector('.gallery'),
  form: document.querySelector('.search-form'),
  spinner: document.querySelector('.lds-dual-ring '),
  loadMoreBtn: document.querySelector('.load-more'),
};

const inputEl = refs.form.elements[0];
let imageCounter = 0;

refs.form.addEventListener('submit', e => {
  e.preventDefault();
  refs.spinner.style.opacity = 1;
  try {
    if (inputEl.value !== '') {
      getImages(inputEl.value).then(() => {
        refs.spinner.style.opacity = 0;
      });
    } else {
      Notiflix.Notify.warning(`The search tab cannot be empty`);
      clearAll();
    }
  } catch {
    refs.spinner.style.opacity = 0;
    Notiflix.Notify.failure('Ooops, Something went wrong');
    refs.loadMoreBtn.style.display = 'none';
  }
});

async function getImages(query) {
  return await pixabayApi
    .fetch(query)
    .then(data => {
      if (data.totalHits !== 0) {
        console.log(data);
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      } else if (pixabayApi.page === data.totalHits) {
        Notiflix.Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
        refs.loadMoreBtn.style.display = 'none';
      } else {
        Notiflix.Notify.info(
          `Sorry! We can't find any images. at your request. Please try again`
        );
        // clearAll();
        // return;
      }

      return data.hits;
    })
    .then(images => {
      if (images.length < 9) {
        console.log(images.length);
        refs.loadMoreBtn.style.display = 'none';
      } else {
        refs.loadMoreBtn.style.display = 'block';
      }
      const markup = images.map(createMarkup);
      refs.gallery.innerHTML = markup.join('');

      addSimpleLightBox();
      loadMoreImages(query);
    });
}

function addSimpleLightBox() {
  const options = {
    enableKeyboard: true,
    docClose: true,
    doubleTapZoom: 2,
    scrollZoom: true,
    preloading: true,
    animationSpeed: 0,
    animationSlide: true,
  };

  let gallery = new SimpleLightbox('.gallery a', options);
  gallery.on('show.simplelightbox');
  return gallery;
}
function updateSimpleLightBox() {
  const options = {
    enableKeyboard: true,
    docClose: true,
    doubleTapZoom: 2,
    scrollZoom: true,
    preloading: true,
    animationSpeed: 0,
    animationSlide: true,
  };

  let gallery = new SimpleLightbox('.gallery a', options);
  gallery.refresh();
}


function loadMoreImages(query) {
  refs.loadMoreBtn.addEventListener('click', () => {
    pixabayApi.page += 1;
    pixabayApi.fetch(query).then(data => {
      imageCounter += data.hits.length;
      refs.gallery.insertAdjacentHTML(
        'beforeEnd',
        data.hits.map(createMarkup).join('')
      );
      addSimpleLightBox().refresh();
      if (imageCounter === data.totalHits) {
        Notiflix.Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
        refs.loadMoreBtn.style.display = 'none';
      }
    });
  });
}