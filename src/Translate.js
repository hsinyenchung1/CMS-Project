import React , { Component } from 'react';
import ProTypes from 'prop-types'
import axios from 'axios';

class Translate extends Component {
  constructor(props){
    super(props);
    this.state = {
      country : props.country,
      language : props.language,
      pageName : props.pageName,
      cmsKey :  props.cmsKey,
      word : 'message.data.cmsMessage'
    }
  }

  componentWillMount(){

    getTranslation(this.props.country, this.props.language, this.props.pageName, this.props.cmsKey, function(response){
      this.setState({
        word : response.data.cmsMessage
      });
    }.bind(this));

  }
  render(){
    return (
      <span>{this.state.word}</span>
    );
  }
}

function getTranslation(country, language, pageName, cmsKey, callback){
  axios.post('/search', {
    "country" : country,
    "language" : language,
    "pageName" : pageName,
    "cmsKey" : cmsKey
  }).then(function(response){
    console.log(response.data.cmsMessage);
    callback(response);
  }).catch(function(error){
    console.log(error);
  });
}

Translate.ProTypes = {
  cmsKey: ProTypes.string,
  language: ProTypes.string, 
  pageName: ProTypes.string,
  country: ProTypes.string
}

export default Translate;
