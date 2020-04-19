# TalkWalker Utilities

# Development

## HTTPS

```
brew install mkcert
mkcert -install
mkcert localhost
```

Then add the relevant environment variables to `.env` and `yarn start` again.

Ref:

- [Using HTTPS in Development](https://create-react-app.dev/docs/using-https-in-development/#custom-ssl-certificate)
- [HTTPS In Development: A Practical Guide](https://marmelab.com/blog/2019/01/23/https-in-development.html)