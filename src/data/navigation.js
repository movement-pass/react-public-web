import ApplyIcon from '@material-ui/icons/Commute';
import CollectIcon from '@material-ui/icons/Receipt';
import FaqIcon from '@material-ui/icons/Forum';
import RegisterIcon from '@material-ui/icons/Create';
import LogInIcon from '@material-ui/icons/Input';
import LogOutIcon from '@material-ui/icons/ExitToApp';

const navigation = {
  apply: {
    text: {
      en: 'Apply',
      bn: ''
    },
    path: '/passes/apply',
    icon: <ApplyIcon />
  },
  collect: {
    text: {
      en: 'Collect',
      bn: ''
    },
    path: '/passes',
    icon: <CollectIcon />
  },
  faq: {
    text: {
      en: 'FAQ',
      bn: ''
    },
    path: '/faq',
    icon: <FaqIcon />
  },
  register: {
    text: {
      en: 'Register',
      bn: ''
    },
    path: '/register',
    icon: <RegisterIcon />
  },
  login: {
    text: {
      en: 'Log In',
      bn: ''
    },
    path: '/login',
    icon: <LogInIcon />
  },
  logout: {
    text: {
      en: 'Log out',
      bn: ''
    },
    icon: <LogOutIcon />
  }
};

export default navigation;
