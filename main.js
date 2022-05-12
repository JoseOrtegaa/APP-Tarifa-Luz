'use strict';

//Seleccionamos todas las etiquetas que queremos editar
const hourHight = document.querySelector('#hourHight');
const pPrice = document.querySelector('#precio-act');
const h2 = document.querySelector('#hora-act');
const section = document.querySelector('.main');
const pAlto = document.querySelector('#precio-alto');
const pBajo = document.querySelector('#precio-bajo');
const hourLow = document.querySelector('#hourLow');
const button = document.querySelector('button');

//Se crea una funcion asincrona para obtener la API
const getData = async () => {
  try {
    const response = await fetch(
      'https://api.allorigins.win/get?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB'
    );
    const data = await response.json();

    //Se obtiene el contenido de la API que almacena los datos necesitados
    const dataLocal = data.contents;

    //Se almacen los datos de la API en el localstorage
    localStorage.setItem('data', dataLocal);

    const date = new Date();
    localStorage.setItem('lastUpdated', date.getTime());

    //CREAR LOS INNER HTML

  } catch (error) {
    console.log(error);
  }
};

//Funcion para clickar boton y que pida datos al servidor
async function loadData(e) {
  try {
    //Cargamos la caché local en localStorage
    const dataLocal = JSON.parse(localStorage.getItem('data'));

    const dataTime = JSON.parse(localStorage.getItem('lastUpdated'));

    let data;

    // Si existe cache local y la diferencia en milisegundos entre la hora actual y la hora de la ultima caché es menor de un minuto (60000 milisegundos) mostramos datos locales
    if (dataLocal && Date.now() - dataTime < 300000) {
      alert(`Usamos datos locales`);
      data = dataLocal;
    } else {
      // Si no pedimos datos de nuevo al servidor
      alert(`Pedimos datos al servidor`);
      data = await getData();
      console.log(data);
      localStorage.setItem(
        'data',
        JSON.stringify({
          lastUpdated: Date.now(),
          data: data,
        })
      );
    }
  } catch (error) {
    alert(`Hubo un error`);
  }
}

//Mediante esta funcion obtenemos el STRING alojado en el localstorage y lo convertimos a OBJETO
function getDataLocal() {
  const data = localStorage.getItem('data');
  const dataObj = JSON.parse(data);
  return dataObj;
}

//Array solo de precios
function getOnlyPrice() {
  const data = getDataLocal();
  let onlyPrice = [];

  for (const key in data) {
    onlyPrice.push(data[key].price);
  }
  return onlyPrice;
}

//Array solo de horas
function getOnlyHour() {
  const data = getDataLocal();
  let onlyHour = [];

  for (const key in data) {
    onlyHour.push(data[key].hour);
  }
  return onlyHour;
}

//Obtenemos el menor precio de luz
const min = (array) => {
  const minimo = Math.min(...array);
  const hourPrice = array.indexOf(minimo);
  hourLow.innerHTML = ` - ${getOnlyHour()[hourPrice]}H`;
  pBajo.textContent = minimo + " €/MhW ";;
  return minimo;
};

//Obtenemos el mayor precio de luz
const max = (array) => {
  const maximo = Math.max(...array);
  const hourPrice = array.indexOf(maximo);
  hourHight.innerHTML = ` - ${getOnlyHour()[hourPrice]}H`;
  pAlto.textContent = maximo + " €/MhW ";
  return maximo;
};

//Funcion para actualizar la hora
const hourAct = () => {
  const time = new Date();
  let hour = time.getHours();
  let minutes = time.getMinutes();
  let seconds = time.getSeconds();

  if (seconds < 10) {
    seconds = `0${seconds}`;
  } else {
    seconds = `${seconds}`;
  }

  if (minutes < 10) {
    minutes = `0${minutes}`;
  } else {
    minutes = `${minutes}`;
  }

  if (hour < 10) {
    hour = `0${hour}`;
  } else {
    hour = `${hour}`;
  }

  const time_act = `${hour}:${minutes}:${seconds}`;
  h2.textContent = time_act;
};

setInterval(hourAct, 1000);

//Funcion para actualizar el precio actual
const currentPrice = async () => {
  const time = new Date();
  let hour = time.getHours();

  //Agregamos el precio actual a un P
  pPrice.innerHTML = `${getOnlyPrice()[hour]} €/MhW`
}

//Creamos un fragmento para ir agrengando los divs
const frag = document.createDocumentFragment();

//Mediante esta funcion creamos los divs corrrespondiente para cada objeto
const dateObj = async () => {
  await getData();
  await currentPrice();
  min(getOnlyPrice());
  max(getOnlyPrice());

  //Igualamos la hora actual a una posicio ndel array para que nos arroje el precio actual y asi poder calcular el precio actual por MegaVatio
  const time = new Date();
  let hour = time.getHours();

  const pMhw = getOnlyPrice()[hour];

  //Dividimos el precio actual en megavatios entre 1000 para si obtener el precio en kilovatios
  const pKhw = pMhw / 1000;

  //Array con informacion de cada objeto, su nombre y su consumo de kWh/h
  const arrayProducts = [{
      name: 'Ordenador',
      price: '0.019',
    },
    {
      name: 'Tv',
      price: '0.03',
    },
    {
      name: 'Nevera',
      price: ' 0.077',
    },
    {
      name: 'Horno-Electrico',
      price: '0.027',
    },
    {
      name: 'Lavadora',
      price: '0.03',
    },
  ];

  //Recorremos el array de objetos para crear un Div de cada uno
  for (const key of arrayProducts) {
    const div = document.createElement(`div`);

    div.innerHTML = ` <h3>${key.name}</h3>
                      <img src="./img/${key.name}.jpg" alt="Imagen de ${key.name}" class="img">
                      <p class="pProducts">El consumo actual durante una hora es de <strong>:${(key.price * pKhw).toFixed(3)}€<strong></p>
                      `;

    //Agregamos cada div al fragmento
    frag.appendChild(div);
  }
  //agregaremos el frag a la section
  section.append(frag);
};

//Llamamaos a la funcion
dateObj();
//Agregamos oyentes al boton
button.addEventListener('click', loadData);