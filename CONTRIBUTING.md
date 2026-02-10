Contributions are welcome, whether in the form of code (new functionality, bug fixes, clarification), improved documentation, or feature requests.

By contributing, you agree to license your code or documentation under the same MIT license that Gorilla Presenter itself uses.

If you have a minor bug fix, it's okay to just raise an issue and include your solution. For more substantial contributions, please make a pull request.

I hold no religious beliefs about code formatting. I do use Visual Studio Code, and periodically (when I think of it) use VSC's built-in Format Document feature to clean things up. If you're making a large contribution, I'd appreciate it if you use that same formatting convention just to keep things tidy. However, don't let that keep you from making a good contribution! I'd rather reformat the code than lose a valued new feature or bug fix.

Thanks in advance!

To contribute, check out this repository (obviously). You can build a package containing your new code by running the build script in the project root (on Unixy systems). It does require that you have node.js installed. 

The built system winds up in index.html in the dist/ folder. You should be able to just open it in your favorite web browser.

The files in package.json are used by some rudimentary Puppeteer-based testing tools. You shouldn't need to worry about those, nor should you need to install any node packages, despite what you might see in package.json.

 If someone wants to contribute an MS-DOS batch file (or whatever Windows is using nowadays) to build the project on Windows, I'd be happy to take a look.
