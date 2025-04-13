function readPackage(pkg) {
  // 处理 date-fns 依赖冲突
  if (pkg.dependencies && pkg.dependencies['date-fns'] === '4.1.0') {
    pkg.dependencies['date-fns'] = '2.30.0';
  }

  // 处理 react-day-picker 依赖
  if (pkg.name === 'react-day-picker') {
    pkg.peerDependencies = pkg.peerDependencies || {};
    pkg.peerDependencies['date-fns'] = '^2.28.0 || ^3.0.0';
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
