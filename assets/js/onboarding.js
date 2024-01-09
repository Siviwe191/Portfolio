function pathfinding_onboard(){
introJs().setOptions({
  steps: [{
      intro: "Welcome! Please take the time to complete this quick tour"
  }, {
      element: document.querySelector('.subheader'),
      intro: "You can select your start and target nodes here - by clicking start or target then click on canvas "
  },{
      element: document.querySelector('.my-nav'),
      intro: "Navigate to the machine learning page"
  },{
      element: document.querySelector('#mazes'),
      intro: "You can select a maze if you require(Optional)"
  },{
      element: document.querySelector('#pathfinders'),
      intro: "Select your pathfinding algorithm"
  },{
      element: document.querySelector('#timetaken'),
      intro: "Select your algorithm speed(Optional)"
  },{
      element: document.querySelector('#run'),
      intro: "Click here to run"
  },{
      element: document.querySelector('#clear'),
      intro: "Click here to clear board"
  },
  ]
  }).start();
}

  function machine_learning(){
    introJs().setOptions({
      steps: [{
          intro: "Welcome! Please take the time to complete this quick tour"
      },{
        element: document.querySelector('#load-button'),
        intro: "Choose load button to load the model "
      }, {
          element: document.querySelector('#prediction-input-1'),
          intro: "Enter the sqaure feet value "
      }, {
        element: document.querySelector('#prediction-input-2'),
        intro: "Enter the value/amount of house "
      }, {
        element: document.querySelector('#predict-button'),
        intro: "Finally click predict button "
      }
      ]
      }).start();
  }