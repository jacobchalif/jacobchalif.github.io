// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "Publications",
          description: "Peer-reviewed publications by year in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-research",
          title: "Research",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/research/";
          },
        },{id: "dropdown-cv",
              title: "CV",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/assets/pdf/Chalif_CV.pdf";
              },
            },{id: "projects-aerosols",
          title: 'Aerosols',
          description: "Sources, transport, and oxidation chemistry",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Aerosols/";
            },},{id: "projects-coldex",
          title: 'COLDEX',
          description: "Interpreting the world&#39;s oldest ice cores from Allan Hills, Antarctica",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Allan_Hills/";
            },},{id: "projects-jet-stream",
          title: 'Jet Stream',
          description: "Extending the record of jet stream waviness (with implications for the &quot;U.S. Warming Hole&quot;)",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Jet_Stream/";
            },},{id: "projects-paleoclimate",
          title: 'Paleoclimate',
          description: "Thinking about Earth&#39;s past climate",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Paleoclimate/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/Chalif_CV.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6A%61%63%6F%62.%69.%63%68%61%6C%69%66.%67%72@%64%61%72%74%6D%6F%75%74%68.%65%64%75", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/jacobchalif", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0001-5401-7148", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=z3tFqOAAAAAJ", "_blank");
        },
      },];
