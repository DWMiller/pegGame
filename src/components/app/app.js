// import createMenu from '../menu/menu';
import './app.css';

export default React => {
  const App = props => (
    <div className="App">
      {props.children}
    </div>
  );

  App.propTypes = {
    children: React.PropTypes.node.isRequired
  };

  return App;
};
