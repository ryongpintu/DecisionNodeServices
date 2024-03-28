// Import the Fastify framework
import fastify from "fastify";
//const fetch = require("got");
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

// Create a new Fastify server instance
const server = fastify()

let questions = [];

// Declare a route
server.post('/questions', async (request, reply) => {

  const answerDetails = request.body;
  let bodyData = {}

  if (answerDetails.answers.length == 0) {

    bodyData = {
      "executableKey": {
        "artifactKey": {
          "releaseName": "MioTest",
          "tagName": "MIO",
          "name": "PropertyWaterDamageFirstNoticeOfLossProcessingActionCode",
          "artifactType": "DECISION"
        },
        "version": "1.0",
        "viewName": "Base"
      },
      "executionInput": {
        "Root": {
        }
      }

    }

  } else {
    const rootData = {}
    const root = answerDetails.answers.map(answer => {

      let key = answer.questionModel;

      rootData[key] = answer.value

    }

    )
    bodyData = {
      "executableKey": {
        "artifactKey": {
          "releaseName": "MioTest",
          "tagName": "MIO",
          "name": "PropertyWaterDamageFirstNoticeOfLossProcessingActionCode",
          "artifactType": "DECISION"
        },
        "version": "1.0",
        "viewName": "Base"
      },
      "executionInput": {
        "Root": {
          ...rootData
        }
      }

    }
  }




  const getFactType = await fetch('https://lifeclaims.de.sapiens.com/de/ws/rs/api/execute/decision', {
    method: 'post',
    body: JSON.stringify(bodyData),
    headers: { 'Content-Type': 'application/json' }
  })


  const factTypeDetails = await getFactType.json();


  let getNextQuestion = ''


  const body = {
    artifactKey: {
      releaseName: "MioTest",
      tagName: "MIO",
      name: "PropertyWaterDamageFirstNoticeOfLossProcessingActionCode",
      artifactType: "DECISION"
    }
  };

  let response = [];
  const questionData = {}
  if (response.length === 0) {

    response = await fetch('https://lifeclaims.de.sapiens.com/de/ws/rs/api/execute/manifest', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })


    questions = await response.json();


    const getGetQuestion = (question) => {

      const questionElement = question.targetModelCustomProperties.element
      if (questionElement[0].property == "Question Tag")
        return questionElement[0].value
      else
        return ""


    }


    const getDataType = (quest) => {
      let dataType = quest.dataType;
      let data = {}

      switch (dataType) {
        case 'CODE':
          data.dataType = 'dropdown'
          data.answerOption = quest.validValues.value.map(data => {
            return {
              "label": data,
              "value": data
            }
          })
          break;
        case 'INDICATOR':
          data.dataType = 'radio'
          data.answerOption = quest.validValues.value.map(data => {
            return {
              "label": data,
              "value": data
            }
          })
          break;
        default:
          data.dataType = 'text'
      }

      return data
    }


    const questionModified = questions.asset[0].group.factType.map((question) => {
      const type = getDataType(question)
      let questionDetail


      if (question.isConclusion == false) {

        questionDetail = {
          "id": uuidv4(),
          "questionModel": question.modelMapping,
          "label": getGetQuestion(question),
          "isRequired": true,
          "cssClassNameUnAnswered": "question-unanswered",
          "isEditable": false,
          "answersType": type.dataType,
          "checkMe": question.dataType,
          "variant": "outlined",
          "placeholder": "Please enter some text",
          "answersOptions": type.answerOption
        }

        const key = question.modelMapping

        questionData[key] = questionDetail
      }



    }


    )


  }




  if (factTypeDetails.requiredFactTypes && factTypeDetails.requiredFactTypes.length > 0) {
    const key = factTypeDetails.requiredFactTypes[0]
    getNextQuestion = questionData[key]
  } else {

    getNextQuestion = factTypeDetails.conclusion;


  }






  return getNextQuestion
})

server.get('/status', function (req, res) {
  res.send("serve is up")
})

// Start the server
server.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err)
    process.exit(1)
  }
  console.log('Server listening on port ', process.env.PORT)
})










