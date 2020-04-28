import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>Created by Siva, Copyright ⓒ {year}</p>
    </footer>
  );
}

export default Footer;
