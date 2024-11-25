import type { Schema } from "formity";

const schema: Schema = [
  {
    form: {
      defaultValues: {
        tokenName: ["", []],
        tokenSymbol: [18, []],
      },
      resolver: {
        name: [
          [{ "#$ne": ["#$tokenName", ""] }, "Required"],
          [{ "#$lt": [{ "#$strLen": "#$tokenName" }, 20] }, "No more than 20 chars"],
        ],
      },
      render: {
        form: {
          step: "$step",
          defaultValues: "$defaultValues",
          resolver: "$resolver",
          onNext: "$onNext",
          children: {
            formLayout: {
              heading: "Token information",
              description: "",
              fields: [
                {
                  textField: {
                    name: "tokenName",
                    label: "Token name",
                  },
                },
                {
                  numberField: {
                    name: "tokenSymbol",
                    label: "Token Symbol",
                  },
                },
              ],
              button: {
                next: { text: "Next" },
              },
            },
          },
        },
      },
    },
  },
  {
    cond: {
      if: { $gte: ["$tokenSymbol", 18] },
      // biome-ignore lint/suspicious/noThenProperty: <explanation>
      then: [
        {
          form: {
            defaultValues: {
              drive: [true, []],
            },
            resolver: {},
            render: {
              form: {
                step: "$step",
                defaultValues: "$defaultValues",
                resolver: "$resolver",
                onNext: "$onNext",
                children: {
                  formLayout: {
                    heading: "Can you drive?",
                    description: "We would want to know if you can drive",
                    fields: [
                      {
                        yesNo: {
                          name: "drive",
                          label: "Drive",
                        },
                      },
                    ],
                    button: {
                      next: { text: "Next" },
                    },
                    back: {
                      back: { onBack: "$onBack" },
                    },
                  },
                },
              },
            },
          },
        },
      ],
      else: [{ variables: { drive: false } }],
    },
  },
  {
    return: {
      name: "$tokenName",
      age: "$tokenSymbol",
      drive: "$drive",
    },
  },
];

export default schema;
