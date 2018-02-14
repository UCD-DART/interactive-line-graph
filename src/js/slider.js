import { timeFormat } from "d3";

const FakeSlider = (sliderId, tableId) => {
  let fake = [];

  const formatDate = timeFormat("%b %d, %Y");

  for (let i = 0; i < 100; i++) {
    let obj = {};
    let date = new Date("06-01-2017");

    date.setDate(date.getDate() + i);
    obj["date"] = formatDate(date);
    obj["tempMin"] = +(Math.random() * 20).toFixed(2);
    obj["tempMax"] = +(Math.random() * 20 + obj["tempMin"]).toFixed(2);
    obj["risk"] = +(Math.random() * 3).toFixed(2);
    obj["bites"] = +(Math.random() * 50).toFixed(1);
    obj["survival"] = +(Math.random() * 50 + 25).toFixed(0);

    fake.push(obj);
  }

  const slider = document.getElementById(sliderId);
  const table = document.getElementById(tableId);

  function showTable(i) {
    let data = fake[i];

    let html = `

        <p> Date: ${data.date}</p>
        <table>
          <th>
              <td class='table-headers'> Min Temp</td>
              <td class='table-headers'> Max Temp </td>
              <td class='table-headers'> Risk Idx</td>
              <td class='table-headers'> Bites per Person</td>
              <td class='table-headers'> Daily Survival of mosq</td>
          </th>

          <tr class='table-data'>
            <td> City's Data </td>
            <td> ${data.tempMin}</td>
            <td> ${data.tempMax}</td>
            <td> ${data.risk}</td>
            <td> ${data.bites}</td>
            <td> ${data.survival}%</td>
          </tr>
          
        </table>
      
      `;
    table.innerHTML = html;
  }
  slider.oninput = function() {
    showTable(this.value);
  };

  showTable(50);
};

module.exports = FakeSlider;
