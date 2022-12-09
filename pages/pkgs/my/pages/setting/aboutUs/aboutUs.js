Page({
  /**
   * 联系商家
   * @param
   * @return
   */
  contactShop: function () {
    wx.makePhoneCall({
        phoneNumber: '400-133-5668',
    })
  }
})