# Screenshot To Faithful Page

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://screenshot-to-faithful-page.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6243859d-78a7-4ad9-bec9-c8c72bed9ece).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## Material images for Botnoi / LINE

GET `/api/public/materials` returns `name`, `price`, `unit`, and an absolute `imageUrl` in each item. Existing filters (`search`, `category`, `maxPrice`) are unchanged. Images are the existing category illustrations, not individual product photos.

After publishing, test `/api/public/materials?search=MAT004` and open the returned `imageUrl` in a browser. Use `name` for the product title and `imageUrl` for the image in Botnoi / LINE. Configuring a Flex Message in Botnoi is a separate step.
