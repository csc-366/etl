
export async function register(req, res) {

}

export async function getUser(req,res) {

}

export async function deleteUser(req,res) {

}

export async function updateUser(req,res) {

}

export async function approveUser(req,res) {

}

export const validate = (method) => {
   switch (method) {
      case 'register':
         return [];
      case 'getUser':
         return [];
      case 'deleteUser':
         return [];
      case 'updateUser':
         return [];
      case 'approveUser':
         return [];

      default:
         return [];
   }

}