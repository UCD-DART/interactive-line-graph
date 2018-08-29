export const Slider = function(divId, length) {
  //id is the element id we are going to append to
  // data is the list of items (probably arrays) that the slider will pull from
  const id = divId || 'slider';

  const min = 0;
  const max = length - 1;
  const start = 27;

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

export const DualSlider = function(divId, length) {
  const id = divId || 'slider';

  const min = 0;
  const max = length - 1;

  document.getElementById(id).innerHTML = `
    <section class="range-slider">
      <span class="rangeValues"></span>
      <input id="date1" value="${max - 9}" min="0" max=${max}  type="range" class="multi-slider">
      <input id="date2" value="${max - 1}" min="0" max=${max}  type="range" class="multi-slider">
    </section>

  `;
};
