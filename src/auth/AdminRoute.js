import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import { isAuthenticated } from './index';

const AdminRouter = ({component: Component}, ...rest) => (
    <Route
        {...rest}
        render={props =>
            isAuthenticated() && isAuthenticated().user.role === 1 ? (
                <Component {...props} />
            ) : (
                <Redirect to={{
                    pathname: '/signin',
                    state: { from : props.location}
                    }}
                />
            )
        }
    />
)

export default AdminRouter;
