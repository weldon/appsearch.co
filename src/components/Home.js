import React, { Component } from "react";
import "../styles/Home.css";
import jsonp from "jsonp";

class Home extends Component {

	constructor(props) {
		super(props);
		this.state = {
			items: [],
		};


		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	getAppId(previewURL) {
	try {
		const re = /\d{6,}/;
		return previewURL.match(re)[0];

	} catch(err) {
		return err.message;
	}}

	handleChange(event) {
	this.setState({input: event.target.value});
	}

	handleSubmit(event) {
		event.preventDefault();
		let term = this.state.input;
		let lookupURL = "https://itunes.apple.com/search?entity=software&term=" + term;
		jsonp(lookupURL, null, (err, data) => {
		   if (err) {
			 console.error(err.message);
		   } else {
			 this.setState({items: data.results});
			this.setState(() => ({
			}))
		   }
		 });
	 }


  render() {
  	let items = this.state.items
    return (
	     <div className="Home">
	                <form id="previewURLForm" onSubmit={this.handleSubmit}>
	        		<label>
					<p>Enter an iOS app name below:</p>
					</label>
					<p><input autoFocus id="previewURL" type="text" value={this.state.input} onChange={this.handleChange} /></p>
	        		<p><input type="submit" value="Submit" /></p>
	      		</form>
			<div className="searchResults">
				{this.state.items.length} results
				<div className="appList">
					      {items.map(item => 
							<div className="appDetails">
								<div className="appIcon icon-wrapper icon-wrapper--128">
										<img src={item.artworkUrl512}
									    className="icon icon--128 icon--post-ios7"
								        width="128"
									    height="128"
										/>
								</div>
								<div className="appText">
									<h1 className="product-header-title app-header-title">{item.trackName}</h1>
									<p>{item.bundleId}</p>
									<a className="appStoreLink" href={`${item.trackViewUrl}`}></a>
								</div>
							</div>
					      	)}	
				</div>
			</div>
        <div className="lander">
          <h1>AppSearch</h1>
          <p>Brought to you by Rewind Technology</p>
        </div>
      </div>
    );
  }
}

export default Home;
