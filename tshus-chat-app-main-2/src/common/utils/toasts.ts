const toasts = {
  loading: async (api: any, config: any) => {
    // Running Success
    const runSuccess = (config: any, resolve: any, data: any = null) => {
      // Check success
      config?.success &&
        typeof config?.success === 'function' &&
        config.success(data);

      // Close message
      api.destroy();

      // Resolved
      resolve();
    };

    // Running Error
    const runError = (config: any, rejected: any, data: any = null) => {
      // Check error
      config?.error &&
        typeof config?.error === 'function' &&
        config.error(data);

      // Close message
      api.destroy();

      // Rejected
      rejected();
    };

    // Open message
    api.open({
      type: 'loading',
      content: config.state.loading,
      duration: 0,
    });

    // Exception
    try {
      // Create Promise
      const handling = new Promise((resolve, rejected) =>
        setTimeout(
          () => {
            // Check
            if (config?.validate && typeof config?.validate === 'function') {
              // Validate
              config
                .validate()
                .then((res: any) => {
                  // Check and Run success handle or error handle
                  res
                    ? runSuccess(config, resolve, res)
                    : runError(config, rejected, res);
                })
                .catch((err: any) => {
                  // Check and running error handle
                  runError(config, rejected, err);
                });
            } else {
              // Check and Run Handle
              runSuccess(config, resolve);
            }
          },
          config.delay ? config.delay : 2000,
        ),
      );

      // Call handling messenger loading
      await handling
        .then(() => {
          // Call success messenger
          setTimeout(() => {
            // Call success messenger
            api.success(config.state.success);
          }, 300);
        })
        .catch(() => {
          // Call success messenger
          setTimeout(() => {
            // Call success messenger
            api.error(config.state.error);
          }, 300);
        });
    } catch (error) {
      // Close message
      api.destroy();
    }
  },
};
export default toasts;
