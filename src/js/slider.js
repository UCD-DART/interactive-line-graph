export const Slider = function(divId, length) {
  //id is the element id we are going to append to
  // data is the list of items (probably arrays) that the slider will pull from
  const id = divId || "slider";

  const min = 0;
  const max = length - 1;
  const start = Math.floor(length / 4);

  document.getElementById(id).innerHTML = `
    <input 
      type='range' 
      min=${min} 
      max=${max} 
      value=${start}
      class='slider'
      id='pickDate'
    >
  `;
};
