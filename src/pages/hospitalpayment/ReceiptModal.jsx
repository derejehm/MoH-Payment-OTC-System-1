import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/system';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const formatter = new Intl.NumberFormat("en-us", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

const formatAccounting = (num) => {
  const formatted = formatter.format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows,
    padding: theme.spacing(2),
  },
  backdropFilter: 'blur(5px)',
}));

const ReceiptModal = ({ open, onClose, data, onPrint }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullScreen={fullScreen}
    >
      <DialogTitle>Payment Receipt</DialogTitle>
      <DialogContent dividers>
        {data && data !== null && (
          <Typography component="pre" style={{ fontFamily: 'Courier, monospace' }}>
                  -----------------------------------
            {'\n'}       Hospital Payment Receipt
            {'\n'}-----------------------------------
            {'\n'}Card Number : {data?.cardNumber}
            {'\n'}Amount      : {formatAccounting(data?.amount?.map((item)=>item.Amount).reduce((a,b)=>parseFloat(a)+parseFloat(b),0) )}
            {'\n'}Method      : {data?.method}
            {'\n'}Reason      : {Array.isArray(data?.reason) ? data?.reason.join(", ") : 'N/A'}
            {'\n'}Description : {data?.description}
            {'\n'}Date        : {new Date().toLocaleDateString()}
            {'\n'}-----------------------------------
            {'\n'}       Thank you for your visit!
            {'\n'}-----------------------------------
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onPrint} color="primary">
          Confirm
        </Button>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ReceiptModal;


// import React from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Slide,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material';
// import { styled } from '@mui/system';
// import { BlobProvider } from '@react-pdf/renderer';
// import Receipt from './Receipt'; // Import your Receipt component

// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

// const StyledDialog = styled(Dialog)(({ theme }) => ({
//   '& .MuiPaper-root': {
//     borderRadius: theme.shape.borderRadius * 2,
//     boxShadow: theme.shadows,
//     padding: theme.spacing(2),
//   },
//   backdropFilter: 'blur(5px)',
// }));

// const ReceiptModal = ({ open, onClose, data, onPrint }) => {
//   const theme = useTheme();
//   const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

//   return (
//     <StyledDialog
//       open={open}
//       onClose={onClose}
//       TransitionComponent={Transition}
//       fullScreen={fullScreen}
//     >
//       <DialogTitle>Payment Receipt</DialogTitle>
//       <DialogContent dividers>
//         {data && data !== null && (
//           <BlobProvider document={<Receipt data={data} />}>
//             {({ url, loading }) =>
//               loading ? (
//                 <p>Loading PDF...</p>
//               ) : (
//                 <iframe
//                   src={url}
//                   title="Receipt Preview"
//                   style={{
//                     width: '100%',
//                     height: '500px',
//                     border: 'none',
//                   }}
//                 />
//               )
//             }
//           </BlobProvider>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button
//           onClick={() => {
//             onPrint(data); // Pass data to the print function
//           }}
//           color="primary"
//         >
//           Print
//         </Button>
//         <Button onClick={onClose} color="secondary">
//           Close
//         </Button>
//       </DialogActions>
//     </StyledDialog>
//   );
// };

// export default ReceiptModal;

