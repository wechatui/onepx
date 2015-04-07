##onepx

onepx is a javascript function to draw a retina 1px line without changing any css.

##How to use

```html
<!--some elements with 1px border-->
<script src="onepx.js"></script>
<script>
    onepx("*");
</script>
```

##API

###onepx(selectors, [parentSelector][isListen]);

- `selectors`：String, the selectors that need to be drew the retina 1px line, separated by commas.

- `parentSelector`：String, targets's parent selector, used to reduce the scope of observing, default `body`

- `isListen`：Boolean, observe the element if true, when element added dynamically, check them if need to drew 1px



###More Examples
####Elements match ".item" will be drew
```script
onepx(".item");
```

####Elements match ".item" or ".box" will be drew
```script
onepx(".item, .box");
```

####Elements match ".item" which parents match ".list" will be drew
```script
onepx(".item", ".list");
```

####Elements match ".appendItem" will be drew, even they are added dynamically
```script
onepx(".appendItem", true);
```

#### If you want to custom style to 1px line, use like this
```html
<li class="customItem" onepx=".customItem:acitve@border-color:blue&.customItem:hover@border-color:green"></li>
```

The rule is: selector@custom style&selector@custom style&...


##体验

![](http://wechatui.github.io/swiper/images/example.jpg)

##License

onepx is available under the terms of the [MIT License](http://www.opensource.org/licenses/mit-license.php).
