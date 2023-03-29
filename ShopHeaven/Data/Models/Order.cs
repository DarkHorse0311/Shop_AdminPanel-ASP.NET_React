﻿using ShopHeaven.Data.Models.Common;
using ShopHeaven.Data.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopHeaven.Data.Models
{
    public class Order : BaseModel, ICreatableModel
    {
        private decimal _totalPriceWithNoDiscount;
        private decimal _totalPriceWithDiscount;
        private decimal _totalPriceWithDiscountAndCoupon;

        public Order()
        {
            Products = new HashSet<ProductOrder>();
        }

        public string Details { get; set; }


        [Required(ErrorMessage = "Address field cannot be null or empty")]
        public string Address { get; set; }

        public decimal TotalPriceWithNoDiscount { get => CalculateTotalPriceWithNoDiscount(); private set => _totalPriceWithNoDiscount = value; }

        public decimal TotalPriceWithDiscount { get => CalculateTotalPriceWithDiscount(); private set => _totalPriceWithDiscount = value; }

        public decimal TotalPriceWithDiscountAndCoupon { get => CalculateTotalPriceWithDiscountAndCoupon(); private set => _totalPriceWithDiscountAndCoupon = value; }

        [Required]
        public string CouponId { get; set; }

        public Coupon Coupon { get; set; }

        [Required]
        public string PaymentId { get; set; }

        public Payment Payment { get; set; }

        public OrderStatus Status { get; set; }

        public ShippingMethod ShippingMethod { get; set; }

        public decimal ShippingAmount { get; set; }

        public string CreatedById { get; set; }

        [ForeignKey(nameof(CreatedById))]
        [InverseProperty("Orders")]
        public User CreatedBy { get; set; }

        public ICollection<ProductOrder> Products { get; set; } // this order contain these products

        private decimal CalculateTotalPriceWithNoDiscount()
        {
            return Products.Sum(x => x.Product.Price * x.Quantity);
        }
        private decimal CalculateTotalPriceWithDiscount()
        {
            return TotalPriceWithNoDiscount - Products.Sum(x => (x.Product.Discount * x.Product.Price) / 100);
        }

        private decimal CalculateTotalPriceWithDiscountAndCoupon()
        {
            return TotalPriceWithDiscount - Coupon.Amount * TotalPriceWithDiscount / 100;
        }
    }
}