import jwtDecode from 'jwt-decode';

const endpoint =
  process.env.NODE_ENV === 'production'
    ? 'https://public-api.movement-pass.com/v1'
    : 'http://localhost:5001';

const storageKey = 'mp:auth';

let _authorization;

function getAuthorization() {
  if (_authorization) {
    return _authorization;
  }

  const token = sessionStorage.getItem(storageKey);

  if (!token) {
    return undefined;
  }

  const decoded = jwtDecode(token);

  // noinspection JSUnresolvedVariable
  _authorization = {
    token,
    expireAt: decoded.exp,
    id: decoded.id,
    name: decoded.name,
    photo: decoded.photo
  };

  return _authorization;
}

async function req(method, relativePath, body) {
  const opt = {
    method,
    mode: 'cors',
    headers: {
      Accept: 'application/json'
    }
  };

  const authorization = getAuthorization();

  if (authorization) {
    opt.headers.Authorization = `Bearer ${authorization.token}`;
  }

  if (body) {
    opt.headers['Content-Type'] = 'application/json;charset=utf-8';
    opt.body = JSON.stringify(body);
  }

  const res = await fetch(`${endpoint}${relativePath}`, opt);

  if (!res.ok) {
    switch (res.status) {
      case 400: {
        return await res.json();
      }
      case 401:
      case 403: {
        return {
          errors: ['Unauthorized!']
        };
      }
      case 404: {
        return {
          errors: ['Not found!']
        };
      }
      default: {
        const result = await res.text();
        console.error(`${method} ${relativePath}:`, result);
        return {
          errors: ['Internal server error!']
        };
      }
    }
  }

  if (res.status === 204) {
    return null;
  }

  return await res.json();
}

const Api = {
  uploadPhoto: async (file) => {
    const res = await req('POST', '/identity/photo', {
      contentType: file.type,
      filename: file.name
    });

    await fetch(res.url, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': file.type,
        'Cache-Control': `private,max-age=${60 * 60 * 24 * 365},must-revalidate`
      },
      body: file
    });

    return `${process.env.REACT_APP_PHOTOS_DOMAIN}/${res.filename}`;
  },

  register: async (input) => {
    const res = await req('POST', '/identity/register', input);

    if (res.token) {
      sessionStorage.setItem(storageKey, res.token);
      return null;
    }

    return res;
  },

  login: async (input) => {
    const res = await req('POST', '/identity/login', input);

    if (res.token) {
      sessionStorage.setItem(storageKey, res.token);
      return null;
    }

    return res;
  },

  logout: () => {
    _authorization = null;
    sessionStorage.removeItem(storageKey);
  },

  getUser: () => {
    const authentication = getAuthorization();

    if (!authentication || authentication.expireAt <= Date.now() / 1000) {
      return null;
    }

    return {
      id: authentication.id,
      name: authentication.name,
      photo: authentication.photo
    };
  },

  applyPass: (input) => req('POST', '/passes', input),

  getPasses: (startKey) => {
    let relativePath = '/passes';

    // noinspection JSUnresolvedVariable
    if (startKey && startKey.id && startKey.endAt) {
      relativePath += `?id=${encodeURIComponent(
        startKey.id
      )}&endAt=${encodeURIComponent(startKey.endAt)}`;
    }

    return req('GET', relativePath);
  },

  getPass: (id) => req('GET', `/passes/${id}`)
};

export default Api;
