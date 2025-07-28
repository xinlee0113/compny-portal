module.exports = {
  // 基本格式化规则
  semi: true,              // 使用分号
  trailingComma: 'es5',    // 在ES5中有效的尾随逗号
  singleQuote: true,       // 使用单引号
  doubleQuote: false,      // 不使用双引号
  
  // 缩进和空格
  tabWidth: 2,             // tab宽度为2空格
  useTabs: false,          // 使用空格而不是tab
  
  // 行宽和换行
  printWidth: 80,          // 每行最大长度
  endOfLine: 'lf',         // 使用LF换行符
  
  // 括号和引号
  bracketSpacing: true,    // 对象字面量括号内有空格
  bracketSameLine: false,  // 多行JSX元素最后的>单独一行
  
  // 箭头函数
  arrowParens: 'avoid',    // 单参数箭头函数省略括号
  
  // 特定文件类型配置
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always'
      }
    }
  ]
};