// import navbar from './navbar';
import "../scss/zika.scss";
import "./zika";

const navbar = document.createElement("nav");
navbar.innerHTML = `
    <ul>
        <a href="" class='nav--link'>
            <li>California Maps</li>
        </a>
        <a href="" class='nav--link'>
            <li>only running from index.js</li>
        </a>
        <a href="" class='nav--link'>
            <li>SLEV</li>
        </a>
        <a href="" class='nav--link active'>
            <li>Zika</li>
        </a>
        <a href="" class='nav--link'>
            <li>Invasive Species</li>
        </a>
    </ul>
`;

const navlinks = document.getElementsByClassName("nav--link");
for (let i = 0; i < navlinks.length; i++) {
  navlinks[i].addEventListener("click", changeMap);
}

function changeMap(map) {}

console.log("still using the index file");

document.getElementById("app").appendChild(navbar);
