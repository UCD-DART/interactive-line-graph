const navbar = document.createElement("nav");
navbar.innerHTML = `
    <ul>
        <a href="" class='nav--link'>
            <li id='change'>California Maps</li>
        </a>
        <a href="" class='nav--link'>
            <li>West Nile</li>
        </a>
        <a href="" class='nav--link'>
            <li>SLEV</li>
        </a>
        <a href="" class='nav--link'>
            <li>Zika</li>
        </a>
        <a href="" class='nav--link active'>
            <li>Invasive Species</li>
        </a>
    </ul>
`;

const navlinks = document.getElementsByClassName("nav--link");
for (let i = 0; i < navlinks.length; i++) {
  navlinks[i].addEventListener("click", function() {
    // add an active class. delete active class from others
  });
}

document.getElementById("nav").appendChild(navbar);