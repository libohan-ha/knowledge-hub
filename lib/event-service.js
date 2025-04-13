// 创建一个简单的事件系统，用于组件间通信
const eventListeners = {};

/**
 * 注册事件监听器
 * @param {string} eventName - 事件名称
 * @param {Function} callback - 回调函数
 * @returns {Function} - 用于移除监听器的函数
 */
export function addEventListener(eventName, callback) {
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = [];
  }
  
  eventListeners[eventName].push(callback);
  
  // 返回一个函数，用于移除监听器
  return () => {
    removeEventListener(eventName, callback);
  };
}

/**
 * 移除事件监听器
 * @param {string} eventName - 事件名称
 * @param {Function} callback - 要移除的回调函数
 */
export function removeEventListener(eventName, callback) {
  if (!eventListeners[eventName]) return;
  
  const index = eventListeners[eventName].indexOf(callback);
  if (index !== -1) {
    eventListeners[eventName].splice(index, 1);
  }
}

/**
 * 触发事件
 * @param {string} eventName - 事件名称
 * @param {any} data - 事件数据
 */
export function dispatchEvent(eventName, data) {
  if (!eventListeners[eventName]) return;
  
  eventListeners[eventName].forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error in event listener for ${eventName}:`, error);
    }
  });
}

// 定义应用中使用的事件名称
export const EVENTS = {
  CONTENT_SAVED: 'content_saved',
  CONTENT_DELETED: 'content_deleted',
  CONTENT_CLASSIFIED: 'content_classified'
};
