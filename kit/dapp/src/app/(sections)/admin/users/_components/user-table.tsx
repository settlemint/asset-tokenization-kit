'use client';

// const ListAllUsers = hasuraGraphql(`
// query ListAllUsers {
//   starterkit_wallets(order_by: {email: asc}) {
//     email
//     role
//     wallet
//   }
// }
// `);

export function UsersTable() {
  return (
    <></>
    // <DataTable
    //   columns={[
    //     {
    //       accessorKey: 'email',
    //       header: ({ column }) => {
    //         return <DataTableColumnHeader column={column}>Email</DataTableColumnHeader>;
    //       },
    //       cell: ({ getValue }) => {
    //         const value = getValue<string>();
    //         return <DataTableColumnCell>{value}</DataTableColumnCell>;
    //       },
    //     },
    //     {
    //       accessorKey: 'role',
    //       header: ({ column }) => {
    //         return <DataTableColumnHeader column={column}>Role</DataTableColumnHeader>;
    //       },
    //       cell: ({ getValue }) => {
    //         const value = getValue<string[] | null>();
    //         return <DataTableColumnCell>{value?.join(', ') ?? ''}</DataTableColumnCell>;
    //       },
    //     },
    //     {
    //       accessorKey: 'wallet',
    //       header: ({ column }) => {
    //         return <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>;
    //       },
    //       cell: ({ getValue }) => {
    //         const value = getValue<string>();
    //         return (
    //           <DataTableColumnCell>
    //             <EvmAddress address={value} prefixLength={100}>
    //               <EvmAddressBalances address={value} />
    //             </EvmAddress>
    //           </DataTableColumnCell>
    //         );
    //       },
    //     },
    //     {
    //       id: 'actions',
    //       cell: ({ row }) => {
    //         const { email } = row.original;

    //         return (
    //           <DataTableColumnCell variant="numeric">
    //             <Link href={`/issuer/users/${email}/details`}>
    //               <Button variant="outline">
    //                 <FolderOpen className="h-4 w-4" />
    //                 Details
    //               </Button>
    //             </Link>
    //           </DataTableColumnCell>
    //         );
    //       },
    //     },
    //   ]}
    //   data={[]}
    //   filterColumn="email"
    //   filterPlaceholder="Search by email..."
    // />
  );
}
