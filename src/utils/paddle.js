import { initializePaddle } from "@paddle/paddle-js";

// Paddle 實例
let paddleInstance = null;

// 初始化 Paddle
export const initPaddle = async () => {
  if (paddleInstance) {
    return paddleInstance;
  }

  try {
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
    const clientEnvironment = import.meta.env.VITE_PADDLE_ENVIRONMENT;

    if (!clientToken) {
      console.warn("未設置 VITE_PADDLE_CLIENT_TOKEN，Paddle 將無法初始化");
      return null;
    }

    paddleInstance = await initializePaddle({
      token: clientToken,
      // pwCustomer: {
      //   id: "ctm_01ka4addg2tqasbqfndj2warsz", // replace with a customer Paddle ID
      // },
      eventCallback: (event) => {
        console.log("Paddle event:", event);
      },
    });

    paddleInstance.Environment.set(clientEnvironment);

    return paddleInstance;
  } catch (error) {
    console.error("初始化 Paddle 失敗:", error);
    throw error;
  }
};

// 獲取 Paddle 實例
export const getPaddle = () => {
  return paddleInstance;
};

// 打開 Paddle 結帳視窗
export const openPaddleCheckout = async (options) => {
  try {
    const paddle = getPaddle();
    if (!paddle) {
      throw new Error("Paddle 尚未初始化");
    }

    // 打開結帳視窗
    await paddle.Checkout.open({
      items: options.items || [],
      customer: options.customer || {},
      customData: options.customData || {},
      settings: {
        displayMode: "overlay", // 'overlay' 或 'inline'
        theme: "light", // 'light' 或 'dark'
        locale: "zh-TW",
        ...options.settings,
      },
      allowedPaymentMethods: ["card"],
      ...options,
    });

    return true;
  } catch (error) {
    console.error("打開 Paddle 結帳視窗失敗:", error);
    throw error;
  }
};

// 使用產品 ID 打開結帳（訂閱方案）
export const openSubscriptionCheckout = async (priceId, planId, billingCycle) => {
  try {
    const paddle = getPaddle();
    if (!paddle) {
      throw new Error("Paddle 尚未初始化");
    }

    // 打開訂閱結帳視窗
    await paddle.Checkout.open({
      items: [
        {
          priceId: priceId, // Paddle 產品價格 ID
          quantity: 1,
        },
      ],
      customData: {
        planId,
        billingCycle,
      },
      settings: {
        displayMode: "overlay",
        theme: "light",
        locale: "zh-TW",
        successUrl: `${globalThis.location.origin}/subscription?success=true&planId=${planId}&billingCycle=${billingCycle}`,
        successUrlTarget: "_self",
      },
    });

    return true;
  } catch (error) {
    console.error("打開訂閱結帳視窗失敗:", error);
    throw error;
  }
};

// 監聽 Paddle 事件
export const setupPaddleListeners = (callbacks) => {
  const paddle = getPaddle();
  if (!paddle) {
    console.warn("Paddle 尚未初始化，無法設置事件監聽器");
    return;
  }

  // // 訂閱成功事件
  // if (callbacks.onCheckoutCompleted) {
  //   paddle.Checkout.onCheckoutCompleted((data) => {
  //     console.log("結帳完成:", data);
  //     callbacks.onCheckoutCompleted(data);
  //   });
  // }

  // // 結帳關閉事件
  // if (callbacks.onCheckoutClosed) {
  //   paddle.Checkout.onCheckoutClosed((data) => {
  //     console.log("結帳視窗關閉:", data);
  //     callbacks.onCheckoutClosed(data);
  //   });
  // }

  // // 錯誤事件
  // if (callbacks.onError) {
  //   paddle.Checkout.onCheckoutError((error) => {
  //     console.error("結帳錯誤:", error);
  //     callbacks.onError(error);
  //   });
  // }
};

// 清理 Paddle 實例
export const destroyPaddle = () => {
  if (paddleInstance) {
    paddleInstance = null;
  }
};
