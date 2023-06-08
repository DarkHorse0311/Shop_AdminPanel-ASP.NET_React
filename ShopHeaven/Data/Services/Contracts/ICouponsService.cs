﻿using ShopHeaven.Models.Requests.Coupons;
using ShopHeaven.Models.Responses.Coupons;

namespace ShopHeaven.Data.Services.Contracts
{
    public interface ICouponsService
    {
        Task<CouponResponseModel> CreateCouponAsync(CouponRequestModel model);

        Task<ICollection<CouponResponseModel>> GetAllCouponsAsync();

        Task<CouponResponseModel> VerifyCouponAsync(string code);
    }
}