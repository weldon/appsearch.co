import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import NotFound from "./components/NotFound";

export default () =>
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/About" exact component={About} />
    { /* Finally, catch all unmatched routes */ }
	<Route component={NotFound} />
  </Switch>;