<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/mal2ai/laravel-react-blockchain">
    <img src="images/react.png" width="170" height="100">
    <img src="images/plus.png" width="50" height="50">
    <img src="images/laravel.png" width="170" height="100">
  </a>

  <h3 align="center">React & Laravel</h3>

  <p align="center">
    Certificate Verification System using Blockchain
    <br />
    <br />
    <a href="https://youtu.be/pkSqo741-qM">View Demo</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

In today’s digital era, verifying the authenticity of academic and professional certificates remains a major challenge. Institutions and employers often face difficulties confirming the legitimacy of documents, leaving room for forgery and fraud. To solve this issue, this project introduces a Certificate Verification System using Blockchain.

By leveraging the transparency, immutability, and decentralization properties of blockchain, the system ensures that every certificate issued is verifiable and tamper-proof. Built with React on the frontend and Laravel on the backend, the platform allows administrators to upload and manage certificates, while employers and third parties can verify them in real time.

Key Features:
* Secure certificate issuance tied to blockchain records
* Real-time certificate verification using hash comparison
* User-friendly interface for both admin and verifiers
* Decentralized and tamper-proof verification mechanism

This project was developed as part of my Final Year Project and serves as a practical solution for digital credential validation using cutting-edge web and blockchain technologies.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [![React][React.js]][React-url]
* [![Laravel][Laravel.com]][Laravel-url]
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![JQuery][JQuery.com]][JQuery-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

Before running this project locally, ensure the following dependencies are installed on your system:
- **[Composer](https://getcomposer.org/)** – PHP dependency manager  
  👉 [Install Composer](https://getcomposer.org/)

- **[Ganache](https://trufflesuite.com/ganache/)** – Personal Ethereum blockchain for development  
  👉 [Download Ganache](https://trufflesuite.com/ganache/)

- **[IPFS Kubo](https://docs.ipfs.tech/install/command-line/)** – IPFS daemon for decentralized file storage
  👉 [Install IPFS Kubo](https://docs.ipfs.tech/install/command-line/)

- **[Node.js & npm](https://nodejs.org/en)** – JavaScript runtime and package manager
  ```sh
  npm install npm@latest -g
  
- **[Laravel](https://laravel.com/)** – Backend framework  
  ```sh
  composer global require laravel/installer

- **[React](https://react.dev/)** – Frontend framework  
  ```sh
  npm install

- **[Truffle](https://www.npmjs.com/package/truffle)** – Ethereum smart contract development framework
  ```sh
  npm install -g truffle

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

Configure the `.env` file first

1. Clone the repo
   ```sh
   git clone https://github.com/mal2ai/laravel-react-blockchain.git
   ```
2. Redirect to laravel-backend
   ```sh
   cd laravel-backend
   ```
3. Install dependencies for backend API
   ```sh
   composer install
   ```
4. Migrate database
   ```sh
   php artisan migrate
   ```
5. Run Backend API (Laravel)
   ```sh
   php artisan serve
   ```
6. Redirect to react-frontend (in new terminal)
   ```sh
   cd react-frontend
   ```
7. Install Package 
   ```sh
   npm install
   ```
7. Run Frontend (React)
   ```sh
   npm start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the Unlicense License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Akmal - akmalsiti81@gmail.com

Project Link: [https://github.com/mal2ai/laravel-react-blockchain](https://github.com/mal2ai/laravel-react-blockchain)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

This project wouldn’t have been possible without the guidance, resources, and support from many individuals and platforms. I would like to express my sincere gratitude to:

* My Supervisor – For the continuous support, technical guidance, and motivation throughout the project
* Kolej Profesional Baitulmal Kuala Lumpur (KPBKL) – For providing the opportunity and institutional support to explore blockchain in real-world applications
* Open Source Communities – Including Laravel, React, Blockchain.js, and Web3 communities for documentation and support
* IPFS (InterPlanetary File System) – For enabling decentralized storage of certificate metadata and hashes
* Ganache – For providing a personal Ethereum blockchain for development and testing smart contracts
* [GitHub Pages](https://pages.github.com)
* [Font Awesome](https://fontawesome.com)
* [React Icons](https://react-icons.github.io/react-icons/search)

To everyone who contributed, directly or indirectly, thank you for making this project a success.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
