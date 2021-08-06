import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const Style = makeStyles(() => ({
  root: {
    left: '50%',
    position: 'absolute',
    textAlign: 'center',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    verticalAlign: 'middle'
  }
}));

function Spinner(props) {
  const style = Style();

  return (
    <div className={style.root}>
      <CircularProgress {...props} />
    </div>
  );
}

export default Spinner;
