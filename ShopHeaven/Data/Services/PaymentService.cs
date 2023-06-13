﻿using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ShopHeaven.Data.Models;
using ShopHeaven.Data.Services.Contracts;
using ShopHeaven.Models.Requests.Orders;
using ShopHeaven.Models.Responses.Payments;
using Stripe;
using Stripe.Checkout;

namespace ShopHeaven.Data.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationSettings applicationSettings;
        private readonly ShopDbContext db;
        private readonly IOrdersService ordersService;
        private readonly ICartsService cartsService;

        public PaymentService(
            ShopDbContext db,
            IOrdersService ordersServce,
            ICartsService cartsService,
            IOptions<ApplicationSettings> applicationSettings)
        {
            this.db = db;
            this.applicationSettings = applicationSettings.Value;
            this.ordersService = ordersServce;
            this.cartsService = cartsService;
        }

        public async Task<Session> CreateSessionAsync(CreateOrderRequestModel model, decimal totalAmount, ShippingMethod shippingMethod, string appCurrencyCode)
        {
            totalAmount = Math.Round(totalAmount, 2);
            var shippingAmount = Math.Round(shippingMethod.ShippingAmount, 2);

            var options = new SessionCreateOptions
            {
                ShippingOptions = new List<SessionShippingOptionOptions>
                {
                    new SessionShippingOptionOptions
                    {
                        ShippingRateData = new SessionShippingOptionShippingRateDataOptions
                        {
                            FixedAmount = new SessionShippingOptionShippingRateDataFixedAmountOptions
                            {
                                Amount = (long)shippingAmount * 100,
                                Currency = appCurrencyCode.ToLower()
                            },
                            DisplayName = shippingMethod.Name,
                            Type = "fixed_amount",
                        },
                    },
                },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmountDecimal = totalAmount * 100,
                            Currency = appCurrencyCode.ToLower(),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"{GlobalConstants.SystemName} purchase",
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                PaymentMethodTypes = new List<string>
                {
                    "card",
                },
                SuccessUrl = $"{this.applicationSettings.ClientSPAUrl}/payment/success",
                CancelUrl = $"{this.applicationSettings.ClientSPAUrl}/cart",
                Metadata = new Dictionary<string, string> {
                    { nameof(model.CartId), model.CartId },
                    { nameof(model.UserId), model.UserId },
                    { nameof(model.CouponId), model.CouponId },
                    { nameof(model.Recipient), model.Recipient },
                    { nameof(model.Phone), model.Phone },
                    { nameof(model.Country), model.Country },
                    { nameof(model.City), model.City },
                    { nameof(model.Address), model.Address },
                    { nameof(model.ShippingMethod), model.ShippingMethod },
                    { nameof(model.PaymentMethod), model.PaymentMethod },
                    { nameof(model.Details), model.Details },
                }
            };

            var service = new SessionService();
            Session session = await service.CreateAsync(options);

            await CreatePaymentSessionAsync(session.Id, model.UserId, false);

            return session;
        }

        public async Task ProcessPaymentResultAsync(Event stripeEvent)
        {
            var session = stripeEvent.Data.Object as Session;

            if (stripeEvent.Type == Events.CheckoutSessionCompleted)
            {
                // create order
                var createOrderRequestModel = CreateOrderRequestModelFromStripeSessionResponse(session.Metadata);
                var order = await this.ordersService.RegisterOrderAsync(createOrderRequestModel);

                //set paymentSession success to true
                await ChangePaymentSessionStatusAsync(session.Id, true);

                //reduce quantity of ordered products
                await this.ordersService.ReduceQuantityOfProductsAsync(order.Id);

                // empty cart
                await this.cartsService.EmptyCartAsync(createOrderRequestModel.CartId);
            }

            else if (stripeEvent.Type == Events.ChargeFailed)
            {
                //set paymentSession success to false
                await ChangePaymentSessionStatusAsync(session.Id, false);
            }
        }

        private CreateOrderRequestModel CreateOrderRequestModelFromStripeSessionResponse(Dictionary<string, string> metadata)
        {
            var cartId = metadata[nameof(CreateOrderRequestModel.CartId)];
            var userId = metadata[nameof(CreateOrderRequestModel.UserId)];
            var couponId = metadata[nameof(CreateOrderRequestModel.CouponId)];
            var recipient = metadata[nameof(CreateOrderRequestModel.Recipient)];
            var phone = metadata[nameof(CreateOrderRequestModel.Phone)];
            var country = metadata[nameof(CreateOrderRequestModel.Country)];
            var city = metadata[nameof(CreateOrderRequestModel.City)];
            var address = metadata[nameof(CreateOrderRequestModel.Address)];
            var shippingMethod = metadata[nameof(CreateOrderRequestModel.ShippingMethod)];
            var paymentMethod = metadata[nameof(CreateOrderRequestModel.PaymentMethod)];
            var details = metadata[nameof(CreateOrderRequestModel.Details)];


            var createOrderRequestModel = new CreateOrderRequestModel
            {
                CartId = cartId,
                UserId = userId,
                CouponId = couponId,
                Recipient = recipient,
                Phone = phone,
                Country = country,
                City = city,
                Address = address,
                ShippingMethod = shippingMethod,
                PaymentMethod = paymentMethod,
                Details = details,
            };

            return createOrderRequestModel;
        }

        private async Task CreatePaymentSessionAsync(string id, string userId, bool isSuccessful)
        {
            var newPaymentSession = new PaymentSession
            {
                Id = id,
                CreatedById = userId,
                IsSuccessful = isSuccessful,
            };

            await this.db.PaymentSessions.AddAsync(newPaymentSession);

            await this.db.SaveChangesAsync();
        }

        private async Task ChangePaymentSessionStatusAsync(string id, bool isSuccessfull)
        {
            var paymentSession = await this.db.PaymentSessions.FirstOrDefaultAsync(x => x.Id == id && x.IsDeleted != true);

            if (paymentSession == null)
            {
                throw new ArgumentException(GlobalConstants.PaymentSessionNotFound);
            }

            paymentSession.IsSuccessful = isSuccessfull;

            await this.db.SaveChangesAsync();
        }

        public async Task<PaymentSessionResponseModel> GetPaymentSessionAsync(string id)
        {
            var paymentSession = await this.db.PaymentSessions.FirstOrDefaultAsync(x => x.Id == id && x.IsDeleted != true);

            if (paymentSession == null)
            {
                throw new ArgumentException(GlobalConstants.PaymentSessionNotFound);
            }

            var paymentSessionResponseModel = new PaymentSessionResponseModel
            {
                Id = paymentSession.Id,
                CreatedOn = paymentSession.CreatedOn.ToString(),
                IsSuccessful = paymentSession.IsSuccessful,
            };

            return paymentSessionResponseModel;
        }

    }
}
