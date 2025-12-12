'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
    return Promise.all([
      // 2. Thêm cột senderType
      queryInterface.addColumn('Messages', 'senderType', {
        type: Sequelize.STRING,
        allowNull: false,
       defaultValue: 'passenger' // Nên set default để data cũ không bị lỗi
      }),
      // 3. Thêm cột messageType
      queryInterface.addColumn('Messages', 'messageType', {
        type: Sequelize.STRING,
        defaultValue: 'text',
    }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Logic quay lại nếu muốn hoàn tác (undo)
    return Promise.all([
      queryInterface.removeColumn('Messages', 'senderType'),
      queryInterface.removeColumn('Messages', 'messageType'),
    ]);
  }
};

